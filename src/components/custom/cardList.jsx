import { useMemo, useState } from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Account } from '@/lib/Account';

const CardList = ({ 
    children,
    displayCount
}) => {
    const [page, setPage] = useState(0);
    const maxPages = useMemo(() => Math.ceil(children.length / displayCount), [children, displayCount]);

    function gotoPrevPage() {
        setPage(p => Math.max(0, p - 1));
    }

    function gotoNextPage() {
        setPage(p => Math.min(p + 1, maxPages - 1));
    }

    async function gotoPage(pageIndex) {
        if (await Account.isLoggedIn() && pageIndex * displayCount >= 15) {
            location.replace('/login');
        }

        setPage(pageIndex);
    }

    return (
        <div className='flex flex-col gap-3'>
            <div className='grid grid-cols-[repeat(auto-fit,minmax(550px,1fr))] gap-3'>
                {children.slice(page * displayCount, page * displayCount + displayCount)}
            </div>

            {maxPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={gotoPrevPage} />
                        </PaginationItem>

                        {[...Array(maxPages)].map((_, i) =>
                            <PaginationLink key={i} onClick={() => gotoPage(i)}>{i + 1}</PaginationLink>
                        )}

                        <PaginationItem>
                            <PaginationNext onClick={gotoNextPage} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default CardList;