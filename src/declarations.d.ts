// https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript

declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const content: string

  export { ReactComponent }
  export default content
}
