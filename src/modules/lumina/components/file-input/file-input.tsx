import { Button } from '@blueprintjs/core'
import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import Dropzone, { DropzoneProps, DropzoneRenderArgs, FileWithPreview } from 'react-dropzone'
import { File as GraphQLFile } from '../../graphql/client/generated'
import { IBaseProps } from '../base-props'
import { HelpBlock } from '../help-block/help-block'
import { AppToaster } from '../toaster/toaster'
import { FileHolder } from './file-holder'
import { FileItem } from './file-item'
import './_file-input.scss'

const spectronIsRunning = process.env.SPECTRON_IS_RUNNING

export interface IFileInputProps {
  additionalFileButtonClassName?: string
  emptyCueButtonClassName?: string
  emptyCueHelpText?: string
  emptyCueButtonText?: string
  emptyCueContainerClassName?: string
  emptyCueButtonLoading?: boolean
  showItemDeleteButton?: boolean
  showItemAddButton?: boolean
  showToastNotifications?: boolean
  error?: string | null
  dropzoneProps?: DropzoneProps
  layout?: 'horizontal' | 'vertical'
  isSingleFile?: boolean
  innerPadding?: string
  onChange?: (value: Array<Partial<GraphQLFile>>) => void
  onDelete?: (file: GraphQLFile) => void
  onUploadComplete?: (file: GraphQLFile) => void
  renderDeleteConfirmation?: (file: FileHolder | Partial<GraphQLFile>) => string | React.ReactNode
  size?: 'sm' | 'lg'
  value: Array<FileHolder | Partial<GraphQLFile>>
  associatedEntityType?: string
  associatedEntityID?: string
}

export class FileInput extends React.Component<IFileInputProps & IBaseProps> {
  public static defaultProps: Partial<IFileInputProps> = {
    emptyCueButtonText: 'Upload File',
    emptyCueHelpText: 'Drop a PDF, multiple images, or click to select your files',
    additionalFileButtonClassName: '',
    innerPadding: 'mv2',
    onDelete: _.noop,
    onChange: _.noop,
    onUploadComplete: _.noop,
    showItemDeleteButton: true,
    showItemAddButton: true,
    showToastNotifications: true,
  }

  private dropzone: Dropzone | undefined

  public render() {
    const { className, error, layout, isSingleFile, dropzoneProps } = this.props
    return (
      <div className='dropzone w-100 l-fileInput-container'>
        <Dropzone
          {...dropzoneProps}
          activeClassName='is-active'
          activeStyle={{}}
          className={cn('l-fileInput', className, {
            // TODO(louis): need to write this
            'l-fileInput--error': !_.isEmpty(error),
            'l-fileInput--isHorizontalLayout': layout === 'horizontal',
            'l-fileInput--singleFile': isSingleFile,
          })}
          disableClick
          // https://www.npmjs.com/package/@types/react-dropzone not up to date yet
          ref={(ref) => (this.dropzone = ref)}
          onDrop={this.handleOnDrop}
        >
          {this.renderContentWithDropzoneRenderArgs}
        </Dropzone>
      </div>
    )
  }

  private onUploadButtonClick = () => {
    if (spectronIsRunning) {
      // @ts-ignore offline vault console needs this for testing
      const spectronFile: any = JSON.parse(window.SPECTRON_FILE)
      const blob: any = new Blob([spectronFile.content], { type: spectronFile.type })
      blob.name = spectronFile.name
      this.handleOnDrop([blob])
    } else if (this.dropzone) {
      this.dropzone.open()
    }
  }

  private renderContentWithDropzoneRenderArgs = (args: DropzoneRenderArgs) => {
    const { isDragActive, isDragReject } = args
    const { additionalFileButtonClassName, isSingleFile, showItemAddButton, value } = this.props
    const files = value
    const hasFiles = !_.isEmpty(files)
    return (
      <div className='l-fileInputItems overflow-auto'>
        {hasFiles ? this.renderFiles(files) : this.renderEmptyState()}
        {showItemAddButton && hasFiles && !isSingleFile && (
          <div className='mv2'>
            <Button icon='add' className={additionalFileButtonClassName} onClick={this.onUploadButtonClick}>
              Add additional files
            </Button>
          </div>
        )}
        {isDragActive && (
          <div className='flex items-center justify-center l-fileInputOverlay ba b--blue bw1 br2'>
            <HelpBlock className='blue fw6'>Drop to attach files</HelpBlock>
          </div>
        )}
        {isDragReject && (
          <div className='flex items-center justify-center l-fileInputOverlay ba b--blue bw1 br2'>
            <HelpBlock className='black fw6'>This file type is not permitted.</HelpBlock>
          </div>
        )}
      </div>
    )
  }

  private renderEmptyState = () => {
    const {
      emptyCueHelpText,
      emptyCueButtonText,
      innerPadding,
      emptyCueButtonClassName,
      emptyCueContainerClassName,
      emptyCueButtonLoading,
    } = this.props
    return (
      <div
        onClick={this.onUploadButtonClick}
        className={cn('l-fileInputItem-container', innerPadding, emptyCueContainerClassName)}
      >
        <div className='w-100'>
          {emptyCueHelpText && <div className='f7 silver mb2'>{emptyCueHelpText}</div>}
          <Button
            icon='upload'
            className={emptyCueButtonClassName}
            loading={emptyCueButtonLoading}
            data-testid={this.props['data-testid']}
          >
            {emptyCueButtonText}
          </Button>
        </div>
      </div>
    )
  }

  private renderFiles = (files: Array<FileHolder | Partial<GraphQLFile>>) => {
    const { innerPadding, renderDeleteConfirmation, showItemDeleteButton, size } = this.props
    return _.map(files, (file, index) => (
      <FileItem
        key={`${index  }file`}
        file={file}
        innerPadding={innerPadding}
        onDelete={this.handleDeleteFile}
        renderDeleteConfirmation={renderDeleteConfirmation}
        showItemDeleteButton={showItemDeleteButton}
        size={size}
      />
    ))
  }

  /// ///////////////////////////////////////////////////////////////////////////
  // Handlers
  /// ///////////////////////////////////////////////////////////////////////////

  private handleOnDrop = (files: FileWithPreview[]) => {
    if (_.isEmpty(files)) {
      return
    }
    const { onChange, value, associatedEntityType, associatedEntityID } = this.props
    const currentFiles = value || []
    const newFiles = files.map(
      (file) => new FileHolder(file, _.noop, this.handleUploadComplete, associatedEntityType, associatedEntityID),
    )
    const allFiles = _.concat(currentFiles, newFiles)
    onChange(allFiles)
  }

  private handleUploadComplete = (holder: FileHolder, file: GraphQLFile) => {
    const { onChange, onUploadComplete, value: files, showToastNotifications } = this.props
    const index = _.indexOf(files, holder)
    if (index >= 0 && onChange) {
      files[index] = file
      onChange(files)
    }
    if (showToastNotifications) {
      AppToaster.show({
        message: 'Uploaded File',
      })
    }
    onUploadComplete(file)
  }

  private handleDeleteFile = (fileToBeDeleted: FileHolder | GraphQLFile) => {
    const { onChange, onDelete, value } = this.props
    const remainingFiles = value.filter((file) => file.id !== fileToBeDeleted.id)
    if (onDelete) {
      onDelete(fileToBeDeleted as GraphQLFile)
    }
    if (onChange) {
      onChange(remainingFiles)
    }
  }
}
