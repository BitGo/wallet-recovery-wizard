import Promise from 'bluebird'
import _ from 'lodash'

import { File as GraphQLFile } from '../../graphql/client/generated'

export type CompleteHandler = (holder: FileHolder, file: GraphQLFile) => void
export type ProgressHandler = (value: number) => void

export class FileHolder implements Partial<GraphQLFile> {
  public contentType: string
  public name?: string
  public size?: number
  public id?: string

  public file: File
  public preview: string
  public promise: Promise<any>
  public progress: number
  public error?: string
  private progressHandler: ProgressHandler

  constructor(
    file: File,
    progressHandler: ProgressHandler = _.noop,
    completeHandler: CompleteHandler = _.noop,
    associatedEntityType?: string,
    associatedEntityID?: string,
    skipUpload?: boolean,
  ) {
    this.file = file
    this.contentType = file.type
    this.preview = URL.createObjectURL(file)
    this.promise = Promise.resolve()
    this.progress = 0
    this.progressHandler = progressHandler
    this.handleProgress(0)
  }
  private handleProgress = (progress: number) => {
    this.progress = progress
    this.progressHandler(progress)
  }
}
