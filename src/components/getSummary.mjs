export function getSummary(postEntry, maxLength) {
    if (postEntry.data.description !== undefined) {
        return postEntry.data.description
    }

    const cleanText = postEntry.body
      .replace(/^---[\s\S]*?\n---/m, '')
      .replace(/^#+\s+\S+/gm, '')
      .replace(/^```[\s\S]*?\n```/gm, '')
      .replace(/!?\[.*?\]\(.*?\)/g, '')
      .replace(/[\t ]+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()

    return cleanText.slice(0, maxLength).trim() + '...'
}