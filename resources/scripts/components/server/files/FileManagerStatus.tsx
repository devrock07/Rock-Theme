import React, { useContext, useEffect } from 'react';
import { ServerContext } from '@/state/server';
import { CloudUploadIcon, XIcon } from '@heroicons/react/solid';
import asDialog from '@/hoc/asDialog';
import { Dialog, DialogWrapperContext } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Code from '@/components/elements/Code';
import { useSignal } from '@preact/signals-react';

const svgProps = {
    cx: 16,
    cy: 16,
    r: 14,
    strokeWidth: 3,
    fill: 'none',
    stroke: 'currentColor',
};

export const normaliseProgress = (loaded: number, total: number): number => {
    if (!Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0) return 0;

    return Math.min(100, Math.max(0, (loaded / total) * 100));
};

const Spinner = ({ progress, className }: { progress: number; className?: string }) => (
    <svg viewBox={'0 0 32 32'} className={`block flex-none aspect-square ${className || ''}`} aria-hidden={'true'}>
        <circle {...svgProps} className={'opacity-25'} />
        <circle
            {...svgProps}
            stroke={'white'}
            strokeDasharray={28 * Math.PI}
            className={'rotate-[-90deg] origin-[50%_50%] transition-[stroke-dashoffset] duration-300'}
            style={{ strokeDashoffset: ((100 - Math.min(100, Math.max(0, progress))) / 100) * 28 * Math.PI }}
        />
    </svg>
);

const FileUploadList = () => {
    const { close } = useContext(DialogWrapperContext);
    const cancelFileUpload = ServerContext.useStoreActions((actions) => actions.files.cancelFileUpload);
    const clearFileUploads = ServerContext.useStoreActions((actions) => actions.files.clearFileUploads);
    const uploads = ServerContext.useStoreState((state) =>
        Object.entries(state.files.uploads).sort(([a], [b]) => a.localeCompare(b))
    );

    return (
        <div className={'space-y-2 mt-6'}>
            {uploads.map(([id, file]) => (
                <div key={id} className={'flex items-center space-x-3 bg-gray-700 p-3 rounded'}>
                    <Tooltip content={`${Math.floor(normaliseProgress(file.loaded, file.total))}%`} placement={'left'}>
                        <div className={'flex-shrink-0'}>
                            <Spinner progress={normaliseProgress(file.loaded, file.total)} className={'w-6 h-6'} />
                        </div>
                    </Tooltip>
                    <Code className={'flex-1 truncate'}>{file.name}</Code>
                    <button
                        type={'button'}
                        onClick={cancelFileUpload.bind(this, id)}
                        className={
                            'inline-flex min-w-[2.75rem] min-h-[2.75rem] items-center justify-center text-gray-500 hover:text-gray-200 transition-colors duration-75'
                        }
                        aria-label={`Cancel upload for ${file.name}`}
                    >
                        <XIcon className={'w-5 h-5'} aria-hidden={'true'} />
                    </button>
                </div>
            ))}
            <Dialog.Footer>
                <Button.Danger variant={Button.Variants.Secondary} onClick={() => clearFileUploads()}>
                    Cancel Uploads
                </Button.Danger>
                <Button.Text onClick={close}>Close</Button.Text>
            </Dialog.Footer>
        </div>
    );
};

const FileUploadListDialog = asDialog({
    title: 'File Uploads',
    description: 'The following files are being uploaded to your server.',
})(FileUploadList);

export default () => {
    const open = useSignal(false);

    const count = ServerContext.useStoreState((state) => Object.keys(state.files.uploads).length);
    const progress = ServerContext.useStoreState((state) => ({
        uploaded: Object.values(state.files.uploads).reduce((count, file) => count + file.loaded, 0),
        total: Object.values(state.files.uploads).reduce((count, file) => count + file.total, 0),
    }));

    useEffect(() => {
        if (count === 0) {
            open.value = false;
        }
    }, [count]);

    return (
        <>
            {count > 0 && (
                <Tooltip content={`${count} files are uploading, click to view`}>
                    <button
                        className={'relative flex flex-none aspect-square items-center justify-center w-10 h-10'}
                        onClick={() => (open.value = true)}
                        aria-label={`${count} files uploading`}
                    >
                        <Spinner
                            progress={normaliseProgress(progress.uploaded, progress.total)}
                            className={'w-8 h-8'}
                        />
                        <CloudUploadIcon className={'h-3 absolute mx-auto animate-pulse'} />
                    </button>
                </Tooltip>
            )}
            <FileUploadListDialog open={open.value} onClose={() => (open.value = false)} />
        </>
    );
};
