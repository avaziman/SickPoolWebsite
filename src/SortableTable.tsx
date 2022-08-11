import { useEffect, useState } from "react";
const { REACT_APP_API_URL } = process.env;
// TODO: organize this shitshow

export interface LoadTable<Type> {
    (sort: Sort, last_res?: TableResult<Type>): Promise<ApiTableResult<Type>>;
}

export interface TableConfig<Type> {
    id: string;
    isPaginated: boolean;
    columns: Column[];
    showEntry: ShowEntry<Type>;
    loadTable: LoadTable<Type>;
}

export interface ShowEntry<Type> {
    (entry: Type): JSX.Element;
}

export interface Column {
    header: string;
    sortBy?: string;
}

export interface Sort {
    page: number;
    limit: number;
    dir: "desc" | "asc";
    by: string;
}

export interface TableResult<Type> {
    entries: Type[];
    total: number;
}

export interface ApiTableResult<Type> {
    result: TableResult<Type> | null;
    error: string | null;
}

export default function SortableTable<Type>(props: TableConfig<Type>) {

    let [sort, setSort] = useState<Sort>({ page: 0, limit: 10, by: props.columns[0].sortBy ? props.columns[0].sortBy : "", dir: "desc" });
    let [error, setError] = useState<string | undefined>(undefined);
    let [isLoading, setIsLoading] = useState<boolean>(false);
    let [result, setResult] = useState<TableResult<Type> | undefined>(undefined);

    useEffect(() => {
        setIsLoading(true);
        props.loadTable(sort, result).then((res: ApiTableResult<Type>) => {
            if (res.error !== null) {
                setError(res.error);
            }

            if (res.result !== null) {
                setResult(res.result);
            }

            setIsLoading(false);

        }).catch((err: string) => {
            setResult(undefined);
            setError(`Failed to retrieve table`);
            setIsLoading(false);
        });



    }, [sort])

    function onTableHeaderClick(sortby?: string) {
        if (!sortby) return;

        let dir: "desc" | "asc" = "desc";
        if (sort.by === sortby) {
            dir = sort.dir === "desc" ? "asc" : "desc";
        }

        setSort({
            page: 0, // reset the page count if the sortby changes
            limit: sort.limit,
            dir: dir,
            by: sortby
        });
    }

    function onLimitChange(newLimit: number) {
        let newPage = sort.page;
        if (!result) return;

        if (sort.page * sort.limit + newLimit > result?.total) {
            newPage = Math.floor(result?.total / newLimit);
        }
        setSort({
            page: newPage,
            limit: newLimit,
            dir: sort.dir,
            by: sort.by
        });
    }

    function onPageChange(newPage: number) {
        setSort({
            page: newPage,
            limit: sort.limit,
            dir: sort.dir,
            by: sort.by
        });
    }

    return (
        <div>
            <div className="table-holder">
                <table id={props.id} className="sortable-table">
                    <thead>
                        <tr>
                            {props.columns.map(column => {
                                return (
                                    <th onClick={(e) => onTableHeaderClick(column.sortBy)}>
                                        {column.header} {sort.by && sort.by === column.sortBy && (sort.dir === "desc" ? "\u25be" : "\u25b4")}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading === true && <tr><td className="loading" colSpan={props.columns.length}>Loading...</td></tr>}
                        {(result && result.entries.length == 0)
                            && <tr><td className="loading" colSpan={props.columns.length}>
                                No entries found!</td></tr>}
                        {error && <tr><td className="error" colSpan={props.columns.length}>{error} :(</td></tr>}
                        {
                            result && result.entries.map((entry: Type) => {
                                return props.showEntry(entry)
                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className="table-navigator">
                {props.isPaginated === true && <div className="table-navigator-left">
                    <span>Entries per page: </span>
                    <select value={sort.limit} onChange={(e) => { onLimitChange(parseInt(e.target.value)); }}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                }
                {props.isPaginated === true && <div className="table-navigator-center">
                    <span>Page: </span>
                    <select value={sort.page} onChange={(e) => { onPageChange(parseInt(e.target.value)); }}>
                        {
                            (result && result.entries.length > 0) ?
                                //todo: check
                                Array.from(Array(Math.ceil(result.total / sort.limit)).keys())
                                    .map((pageIndex) => { return <option value={pageIndex}>{pageIndex + 1}</option>; })
                                : <option value="0">0</option>
                        }
                    </select>
                </div>
                }
                <div className="table-navigator-right">
                    <span>Showing {sort.limit * sort.page}-{Math.min(sort.limit * (+sort.page + 1), result ? result.total : 0)} of {result ? result.total : 0} entries</span>
                </div>
            </div>
        </div>
    )
}