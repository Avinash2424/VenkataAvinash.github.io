import { graphql } from "@octokit/graphql";

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string } | null;
  repositoryTopics: string[];
  isFork: boolean;
  readmeContent: string | null;
  updatedAt: string;
}

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
const GITHUB_USERNAME =
  import.meta.env.GITHUB_USERNAME ??
  process.env.GITHUB_USERNAME ??
  "Avinash2424";

const REPOS_QUERY = `
  query ($login: String!, $cursor: String) {
    user(login: $login) {
      repositories(
        first: 100
        after: $cursor
        privacy: PUBLIC
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          isFork
          updatedAt
          primaryLanguage {
            name
            color
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          readme: object(expression: "HEAD:README.md") {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
`;

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  if (!GITHUB_TOKEN) {
    console.warn(
      "⚠ GITHUB_TOKEN not set — returning empty repos. Set it in .env or CI secrets.",
    );
    return [];
  }

  const graphqlWithAuth = graphql.defaults({
    headers: { authorization: `token ${GITHUB_TOKEN}` },
  });

  const allRepos: GitHubRepo[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response: any = await graphqlWithAuth(REPOS_QUERY, {
      login: GITHUB_USERNAME,
      cursor,
    });

    const { nodes, pageInfo } = response.user.repositories;

    for (const repo of nodes) {
      const topics: string[] = repo.repositoryTopics.nodes.map(
        (t: any) => t.topic.name,
      );

      allRepos.push({
        name: repo.name,
        description: repo.description,
        url: repo.url,
        homepageUrl: repo.homepageUrl,
        stargazerCount: repo.stargazerCount,
        forkCount: repo.forkCount,
        primaryLanguage: repo.primaryLanguage,
        isFork: repo.isFork,
        readmeContent: repo.readme?.text ?? null,
        repositoryTopics: topics,
        updatedAt: repo.updatedAt,
      });
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  // Prioritize: repos with 'portfolio' topic first, then own repos, then forks
  return allRepos.sort((a, b) => {
    const aPortfolio = a.repositoryTopics.includes("portfolio") ? 0 : 1;
    const bPortfolio = b.repositoryTopics.includes("portfolio") ? 0 : 1;
    if (aPortfolio !== bPortfolio) return aPortfolio - bPortfolio;

    const aOwn = a.isFork ? 1 : 0;
    const bOwn = b.isFork ? 1 : 0;
    if (aOwn !== bOwn) return aOwn - bOwn;

    return b.stargazerCount - a.stargazerCount;
  });
}
