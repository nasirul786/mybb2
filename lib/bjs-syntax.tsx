// Predefined BJS variables and functions for syntax highlighting
export const BJSVariables = ["Bot", "Api", "BBAdmin", "User", "Message", "Chat"]

export const BJSFunctions = {
  Bot: ["sendMessage", "setProp", "getProp", "deleteProp", "sendPhoto", "sendDocument", "sendAudio", "sendVideo"],
  Api: ["sendMessage", "sendPhoto", "sendDocument", "sendAudio", "sendVideo", "editMessage", "deleteMessage"],
  BBAdmin: ["cloneBot", "installBot", "deleteBot", "getBot", "listBots"],
}

export const BJSKeywords = [
  "if",
  "else",
  "for",
  "while",
  "function",
  "return",
  "const",
  "let",
  "var",
  "true",
  "false",
  "null",
  "undefined",
]

export function highlightBJSCode(code: string): string {
  let highlighted = code

  // Highlight variables
  BJSVariables.forEach((variable) => {
    const regex = new RegExp(`\\b${variable}\\b`, "g")
    highlighted = highlighted.replace(regex, `<span class="bjs-variable">${variable}</span>`)
  })

  // Highlight functions
  Object.entries(BJSFunctions).forEach(([obj, methods]) => {
    methods.forEach((method) => {
      const regex = new RegExp(`${obj}\\.${method}`, "g")
      highlighted = highlighted.replace(
        regex,
        `<span class="bjs-variable">${obj}</span>.<span class="bjs-function">${method}</span>`,
      )
    })
  })

  return highlighted
}
