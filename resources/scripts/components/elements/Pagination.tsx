import React from 'react';
import { PaginatedResult } from '@/api/http';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import Button from '@/components/elements/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

interface RenderFuncProps<T> {
    items: T[];
    isLastPage: boolean;
    isFirstPage: boolean;
}

interface Props<T> {
    data: PaginatedResult<T>;
    showGoToLast?: boolean;
    showGoToFirst?: boolean;
    onPageSelect: (page: number) => void;
    children: (props: RenderFuncProps<T>) => React.ReactNode;
}

const Block = styled(Button)`
    ${tw`p-0 w-10 h-10 flex-none`};
    aspect-ratio: 1 / 1;
`;

function Pagination<T>({
    data: { items, pagination },
    showGoToFirst = true,
    showGoToLast = true,
    onPageSelect,
    children,
}: Props<T>) {
    const isFirstPage = pagination.currentPage === 1;
    const isLastPage = pagination.currentPage >= pagination.totalPages;

    const pages = [];

    const start = Math.max(1, Math.min(pagination.currentPage - 1, pagination.totalPages - 2));
    const end = Math.min(pagination.totalPages, start + 2);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <>
            {children({ items, isFirstPage, isLastPage })}
            {pagination.totalPages > 1 && (
                <nav aria-label={'Pagination'} css={tw`mt-4 flex flex-wrap gap-2 justify-center w-full min-w-0`}>
                    {showGoToFirst && pages[0] > 1 && !isFirstPage && (
                        <Block
                            isSecondary
                            color={'primary'}
                            aria-label={'Go to first page'}
                            onClick={() => onPageSelect(1)}
                        >
                            <FontAwesomeIcon icon={faAngleDoubleLeft} />
                        </Block>
                    )}
                    {pages.map((i) => (
                        <Block
                            isSecondary={pagination.currentPage !== i}
                            color={'primary'}
                            key={`block_page_${i}`}
                            aria-label={`Go to page ${i}`}
                            aria-current={pagination.currentPage === i ? 'page' : undefined}
                            onClick={() => onPageSelect(i)}
                        >
                            {i}
                        </Block>
                    ))}
                    {showGoToLast && pages[pages.length - 1] < pagination.totalPages && !isLastPage && (
                        <Block
                            isSecondary
                            color={'primary'}
                            aria-label={'Go to last page'}
                            onClick={() => onPageSelect(pagination.totalPages)}
                        >
                            <FontAwesomeIcon icon={faAngleDoubleRight} />
                        </Block>
                    )}
                </nav>
            )}
        </>
    );
}

export default Pagination;
