import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'

const postsDirectory = path.join(process.cwd(), 'posts')

interface PostMetaData {
  date: string
  update: string
  title: string
  author: string
  translator?: string
  tags?: string
}

export type PostBaseData = { id: string } & PostMetaData

export function getSortedPostsData(): PostBaseData[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as PostMetaData),
    }
  })
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date)
      return 1

    else
      return -1
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    }
  })
}

const hReg = /(<h\d)(>[\d\D]*?){#([-a-zA-Z]*)}(<\/h\d>)/g
const imgReg = /(?<=(?:<img))/g

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(matterResult.content)

  let contentHtml = processedContent.toString()

  contentHtml = imgReg.test(contentHtml) ? contentHtml.replaceAll(imgReg, ' loading="lazy"') : contentHtml

  contentHtml = hReg.test(contentHtml) ? contentHtml.replaceAll(hReg, '$1 id="$3" $2 <a href="#$3">#</a>$4') : contentHtml

  const posts = getSortedPostsData()

  const index = posts.findIndex(post => post.id === id)

  // Combine the data with the id and contentHtml
  return {
    id,
    last: posts[index - 1] || null,
    next: posts[index + 1] || null,
    contentHtml,
    ...(matterResult.data as PostMetaData),
  }
}

type PromiseReturnType<T> = T extends Promise<infer R> ? R : T

export type PostData = PromiseReturnType<ReturnType<typeof getPostData>>
