import axios, { AxiosProgressEvent } from 'axios';
import getFileUploadUrl from '@/api/server/files/getFileUploadUrl';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import React, { useRef } from 'react';
import { ModalMask } from '@/components/elements/Modal';
import Fade from '@/components/elements/Fade';
import useEventListener from '@/plugins/useEventListener';
import { useFlashKey } from '@/plugins/useFlash';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { ServerContext } from '@/state/server';
import { WithClassname } from '@/components/types';
import Portal from '@/components/elements/Portal';
import { CloudUploadIcon } from '@heroicons/react/outline';
import { useSignal } from '@preact/signals-react';

function isFileOrDirectory(event: DragEvent): boolean {
    if (!event.dataTransfer?.types) {
        return false;
    }

    return event.dataTransfer.types.some((value) => value.toLowerCase() === 'files');
}

export const containsDirectory = (items?: DataTransferItemList | null): boolean =>
    Array.from(items || []).some((item) => item.webkitGetAsEntry?.()?.isDirectory === true);

export default ({ className }: WithClassname) => {
    const fileUploadInput = useRef<HTMLInputElement>(null);
    const uploadSequence = useRef(0);

    const visible = useSignal(false);

    const { mutate } = useFileManagerSwr();
    const { addError, clearAndAddHttpError } = useFlashKey('files');

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { removeFileUpload, pushFileUpload, setUploadProgress } = ServerContext.useStoreActions(
        (actions) => actions.files
    );

    useEventListener(
        'dragenter',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFileOrDirectory(e)) {
                visible.value = true;
            }
        },
        { capture: true }
    );

    useEventListener('dragexit', () => (visible.value = false), { capture: true });

    useEventListener('keydown', () => (visible.value = false));

    const onUploadProgress = (data: AxiosProgressEvent, id: string) => {
        setUploadProgress({ id, loaded: data.loaded });
    };

    const onFileSubmission = (files: FileList, items?: DataTransferItemList | null) => {
        clearAndAddHttpError();
        if (containsDirectory(items)) {
            return addError('Folder uploads are not supported.', 'Error');
        }

        const list = Array.from(files);

        const uploads = list.map((file) => {
            const controller = new AbortController();
            const id = `${uuid}:${Date.now()}:${uploadSequence.current++}:${Math.random().toString(16).slice(2)}`;
            pushFileUpload({
                id,
                data: { name: file.name, serverUuid: uuid, directory, abort: controller, loaded: 0, total: file.size },
            });

            return getFileUploadUrl(uuid)
                .then((url) =>
                    axios
                        .post(
                            url,
                            { files: file },
                            {
                                signal: controller.signal,
                                headers: { 'Content-Type': 'multipart/form-data' },
                                params: { directory },
                                onUploadProgress: (data) => onUploadProgress(data, id),
                            }
                        )
                        .then(() => {
                            window.setTimeout(() => removeFileUpload(id), 500);
                            return true;
                        })
                )
                .catch((error) => {
                    removeFileUpload(id);
                    if (controller.signal.aborted || axios.isCancel(error)) return false;

                    clearAndAddHttpError(error);
                    return false;
                });
        });

        Promise.all(uploads).then((completed) => {
            if (completed.some(Boolean)) void mutate().catch(() => undefined);
        });
    };

    return (
        <>
            <Portal>
                <Fade appear in={visible.value} timeout={75} key={'upload_modal_mask'} unmountOnExit>
                    <ModalMask
                        onClick={() => (visible.value = false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            visible.value = false;
                            if (!e.dataTransfer?.files.length) return;

                            onFileSubmission(e.dataTransfer.files, e.dataTransfer.items);
                        }}
                    >
                        <div className={'w-full flex items-center justify-center pointer-events-none'}>
                            <div
                                className={'flex items-center space-x-4 bg-black w-full rounded p-6 mx-10 max-w-sm'}
                                style={{ boxShadow: '0 0 0 4px rgba(var(--shell-accent-rgb), 0.42)' }}
                            >
                                <CloudUploadIcon className={'w-10 h-10 flex-shrink-0'} />
                                <p className={'font-header flex-1 text-lg text-neutral-100 text-center'}>
                                    Drag and drop files to upload.
                                </p>
                            </div>
                        </div>
                    </ModalMask>
                </Fade>
            </Portal>
            <input
                type={'file'}
                ref={fileUploadInput}
                css={tw`hidden`}
                onChange={(e) => {
                    if (!e.currentTarget.files) return;

                    onFileSubmission(e.currentTarget.files);
                    if (fileUploadInput.current) {
                        fileUploadInput.current.value = '';
                    }
                }}
                multiple
            />
            <Button className={className} onClick={() => fileUploadInput.current && fileUploadInput.current.click()}>
                Upload
            </Button>
        </>
    );
};
