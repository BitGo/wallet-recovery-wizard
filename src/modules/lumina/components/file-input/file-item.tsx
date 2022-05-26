import { Button } from '@blueprintjs/core'
import cn from 'classnames'
import _ from 'lodash'
import numeral from 'numeral'
import React from 'react'
import { File as GraphQLFile } from '../../graphql/client/generated'
import ConfirmationDialog from '../confirmation-dialog/confirmation-dialog'
import { Formatter } from '../formatters/formatters'
import { FileHolder } from './file-holder'
// import { Thumbnail } from '../thumbnail/thumbnail'
import './_file-input.scss'

export interface IFileItemProps {
  file: FileHolder | Partial<GraphQLFile>
  innerPadding?: string
  onDelete?: (file: GraphQLFile) => void
  renderDeleteConfirmation?: (file: FileHolder | Partial<GraphQLFile>) => string | React.ReactNode
  showItemDeleteButton?: boolean
  size?: 'sm' | 'lg'
  showThumbnail?: boolean
}

interface IFileItemState {
  isConfirmationDialogOpen: boolean
}

export class FileItem extends React.Component<IFileItemProps, IFileItemState> {
  public static defaultProps: Partial<IFileItemProps> = {
    renderDeleteConfirmation: () => 'Are you sure you want to delete this file?',
  }

  public state = { isConfirmationDialogOpen: false }

  public render() {
    const {
      file,
      // size,
      innerPadding,
      showItemDeleteButton,
      // showThumbnail,
    } = this.props
    const isFileHolder = !_.get(file, 'id')

    // Undefined if uploading a new file, not sure why this happens
    if (_.isEmpty(file)) {
      return null
    }

    if (isFileHolder) {
      return (
        <div className={cn('l-fileInputItem-container', innerPadding)}>
          {/* {showThumbnail && (
            <div className='l-fileInputItemPreview-wrapper mr2'>
              <div className='l-fileInputItemPreview-relative'>
                <Thumbnail
                  imageClassName='l-fileInputItemPreview'
                  file={file}
                  size={size}
                />
              </div>
            </div>
          )} */}
          {this.renderFileHolder(file as FileHolder)}
          {this.renderItemDeleteConfirmationDialog()}
        </div>
      )
    }

    const castedFile = file as GraphQLFile
    if (castedFile.zipMetadata && castedFile.zipMetadata.length > 1) {
      const createdBy = `${castedFile.createdBy.firstName} ${castedFile.createdBy.lastName}`
      const creationDate = Formatter.formatDateTime(new Date(castedFile.creationDate))
      const fileDetail = `${createdBy} uploaded on ${creationDate}`
      return (
        <div className='flex'>
          <div className='pointer flex-grow-1 flex-shrink-1 blue' onClick={() => {}}>
            <div className='fw5 truncate no-underline mb1'>{file.name}</div>
            <div className='f7 silver'>{fileDetail}</div>
            {/* {castedFile.zipMetadata.map((zipMetadata, index) => (
              <div className={cn('l-fileInputItem-container', innerPadding)} key={index}>
                <div className='l-fileInputItemPreview-wrapper mr2'>
                  <div className='l-fileInputItemPreview-relative'>
                    <Thumbnail
                      imageClassName='l-fileInputItemPreview'
                      file={file}
                      size={'sm'}
                    />
                  </div>
                </div>
                <div className='w-100 pr2'>
                  <div className='fw5 gray truncate no-underline'>
                    {zipMetadata.name} <span className='f7 silver fw4'> - {numeral(zipMetadata.size).format('0.0 b')}</span>
                  </div>
                </div>
              </div>
            ))} */}
          </div>
          {showItemDeleteButton && (
            <Button className='bp3-small' onClick={this.handleToggleIsConfirmationDialogOpen}>
              Delete
            </Button>
          )}
          {this.renderItemDeleteConfirmationDialog()}
        </div>
      )
    }
    return (
      <div className={cn('l-fileInputItem-container', innerPadding)}>
        {/* <div className='l-fileInputItemPreview-wrapper mr2'>
          <div className='l-fileInputItemPreview-relative'>
            <Thumbnail
              imageClassName='l-fileInputItemPreview'
              file={file}
              size={size}
            />
          </div>
        </div> */}
        {this.renderGraphqlFileNameAndUploader(file as GraphQLFile)}
        {this.renderItemDeleteConfirmationDialog()}
      </div>
    )
  }

  private renderFileHolder = (file: FileHolder) => {
    const fileDetailClass = file.error ? 'f7 red' : 'f7 silver'
    return (
      <div className='w-100'>
        <div className='fw5 truncate no-underline mb1'>{file.file.name}</div>
        <div className={fileDetailClass}>Uploading file...</div>
      </div>
    )
  }

  private renderGraphqlFileNameAndUploader = (file: GraphQLFile) => {
    const { showItemDeleteButton } = this.props
    const fmtSize = numeral(file.size).format('0.0 b')
    const createdBy = `${file.createdBy.firstName} ${file.createdBy.lastName}`
    const creationDate = Formatter.formatDateTime(new Date(file.creationDate))
    const fileDetail = `${createdBy} uploaded on ${creationDate}`
    return (
      <>
        <div className='db overflow-auto flex-grow-1 flex-shrink-1 pointer blue' onClick={() => {}}>
          <div className='w-100 pr2'>
            <div className='fw5 truncate no-underline mb1'>
              {file.name} <span className='f7 silver fw4'> - {fmtSize}</span>
            </div>
            <div className='f7 silver'>{fileDetail}</div>
          </div>
        </div>
        {showItemDeleteButton && (
          <Button className='bp3-small' onClick={this.handleToggleIsConfirmationDialogOpen}>
            Delete
          </Button>
        )}
      </>
    )
  }

  private renderItemDeleteConfirmationDialog = () => {
    const { file, renderDeleteConfirmation } = this.props
    const { isConfirmationDialogOpen } = this.state
    return (
      <ConfirmationDialog
        confirmationTitle='Delete File'
        confirmationText={renderDeleteConfirmation ? renderDeleteConfirmation(file) : ''}
        primaryButtonText='Delete'
        primaryButtonClassName='bp3-intent-danger'
        secondaryButtonText='Cancel'
        isOpen={isConfirmationDialogOpen}
        onClose={this.handleToggleIsConfirmationDialogOpen}
        onPrimaryClicked={this.handleDelete}
      />
    )
  }

  private handleDelete = () => {
    const { file, onDelete } = this.props
    if (onDelete) {
      onDelete(file as GraphQLFile)
    }
  }

  private handleToggleIsConfirmationDialogOpen = () => {
    this.setState({
      isConfirmationDialogOpen: !this.state.isConfirmationDialogOpen,
    })
  }
}
