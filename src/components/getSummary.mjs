export function getSummary(postEntry, maxLength) {
    if (postEntry.data.description !== undefined) {
        return postEntry.data.description
    }

    const cleanText = postEntry.body
      .replace(/^---[\s\S]*?\n---/m, '')  // remove frontmatter
      .replace(/^#+\s+\S+/gm, '')  // remove headings
      .replace(/^```[\s\S]*?\n```/gm, '')  // remove code blocks
      .replace(/!?\[.*?\]\(.*?\)/g, '')  // remove links and images
      .replace(/[\t ]+/g, ' ')  // merge spaces and tabs
      .replace(/\n+/g, '\n')  // merge line breaks
      .trim()

    return cleanText.slice(0, maxLength).trim() + '...'
}
