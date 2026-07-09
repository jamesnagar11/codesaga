import ProblemLayout from "@/components/ProblemLayout";
import { globalPrismaClient } from "@/lib/prisma";

export type Example = {
  id: string,
  input: string[],
  output: string,
  explanation: string[],
  imgSrc: string | null,
  problemId: string
}

export type ProblemInfo = {
  id: string,
  description: string[],
  examples: Example[],
  difficulty: string,
  title: string,
  imgSrc: string | null,
  problemURL: string,
  topics: string[],
  hints: string[],
}

async function getProblemInfo(problemURL: string) {
  const prisma = globalPrismaClient;
  try {
    const problem = await prisma.problem.findUnique({
      where: {
        problemURL: problemURL
      }, 
      select: {
        id: true,
        description: true,
        examples: {
          select: {
            id: true,
            input: true,
            output: true,
            explanation: true,
            imgSrc: true,
            problemId: true
          }
        },
        difficulty: true,
        title: true,
        imgSrc: true,
        problemURL: true,
        topics: true,
        hints: true,
      }
    })
    return problem;
  } catch (error) {
    console.error(error)
    return null;
  }
}

const page = async (context: { params: Promise<{ slug?: string[] }> }) => {
  const { slug } = await context.params;
  if (!slug || slug.length === 0) {
    return null;
  }
  const problemURL = slug[0]
  const pageType = slug[1] ? slug[1] : 'description';
  const problemInfo = await getProblemInfo(problemURL);

  return (
    <ProblemLayout
      problemInfo={problemInfo}
      pageType={pageType}
      problemURL={problemURL}
    />
  )
}

export default page