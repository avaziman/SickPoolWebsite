import { useEffect, useState } from "react";
import { TableQuerySort } from "./bindings/TableQuerySort";
import { TableRes } from "./bindings/TableRes";
import "./SortableTable.css"
import "./Stats.css"
// TODO: organize this shitshow

export interface LoadTable<Type> {
    (sort: TableQuerySort, last_res?: TableRes<Type>): Promise<TableRes<Type>>;
}

export interface TableConfig<Type> {
    id: string;
    isPaginated: boolean;
    columns: Column[];
    showEntry: ShowEntry<Type>;
    loadTable: LoadTable<Type>;
    defaultSortBy?: string;
}

export interface ShowEntry<Type> {
    (entry: Type): JSX.Element;
}

export interface Column {
    header: string;
    headerShort?: string;
    sortBy?: string;
    width?: string;
}

export default function SortableTable<Type>(props: TableConfig<Type>) {

    let [sort, setSort] = useState<TableQuerySort>({ page: 0, limit: 10, sortby: props.defaultSortBy ? props.defaultSortBy : '', sortdir: "desc" });
    let [isLoading, setIsLoading] = useState<boolean>(false);
    let [error, setError] = useState<string>();
    let [result, setResult] = useState<TableRes<Type>>();
    let [short, setShort] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        props.loadTable(sort, result)
            .then((res: TableRes<Type>) => {
                
                setError(undefined)
                setResult(res);
                setIsLoading(false);

            }).catch((err: string) => {
                setResult(undefined);
                setError(`Failed to retrieve table`);
                setIsLoading(false);
            });
    }, [sort, props])

    function UpdateWidth() {
        let width = window.innerWidth;
        // console.log('width', width)
        if (width < 600) {
            setShort(true);
        } else {
            setShort(false);
        }
    }

    useEffect(() => {
        window.addEventListener('resize', UpdateWidth);
        UpdateWidth();
    }, []);

    function onTableHeaderClick(sortby?: string) {
        if (!sortby) return;

        let dir: "desc" | "asc" = "desc";
        if (sort.sortby === sortby) {
            dir = sort.sortdir === "desc" ? "asc" : "desc";
        }

        setSort({
            page: 0, // reset the page count if the sortby changes
            limit: sort.limit,
            sortdir: dir,
            sortby: sortby
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
            sortdir: sort.sortdir,
            sortby: sort.sortby
        });
    }

    function onPageChange(newPage: number) {
        setSort({
            page: newPage,
            limit: sort.limit,
            sortdir: sort.sortdir,
            sortby: sort.sortby
        });
    }

    return (
        <div>
            <div className="table-holder">
                <table id={props.id} className="sortable-table">
                    <thead>
                        <tr>
                            {props.columns.map((column, i) => {
                                return (
                                    <th onClick={(e) => onTableHeaderClick(column.sortBy)} style={{ width: column.width }} key={column.header}>
                                        {(short && column.headerShort) ? column.headerShort : column.header} {sort.sortby && sort.sortby === column.sortBy && (sort.sortdir === "desc" ? "\u25be" : "\u25b4")}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading === true && <tr><td className="loading" colSpan={props.columns.length}>Loading...</td></tr>}
                        {(result && result.entries.length === 0)
                            && <tr><td className="loading" colSpan={props.columns.length}>
                                No entries found :/</td></tr>}
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
                {props.isPaginated === true &&
                    <div className="table-navigator-left">
                        <span>Per page: </span>
                        <select value={sort.limit} onChange={(e) => { onLimitChange(parseInt(e.target.value)); }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                }
                {props.isPaginated === true &&
                    <div className="table-navigator-center">
                        <span>Page: </span>
                        <select value={sort.page} onChange={(e) => { onPageChange(parseInt(e.target.value)); }}>
                            {
                                (result && result.entries.length > 0) ?
                                    //todo: check
                                    Array.from(Array(Math.ceil(result.total / sort.limit)).keys())
                                        .map((pageIndex) => { return <option value={pageIndex} key={pageIndex}>{pageIndex + 1}</option>; })
                                    : <option value="0">0</option>
                            }
                        </select>
                    </div>
                }
                <div className="table-navigator-right">
                    <span>Showing {sort.limit * sort.page + 1}-{Math.min(sort.limit * (+sort.page + 1), result ? result.total : 0)} of {result ? result.total : 0}</span>
                </div>
            </div>
        </div>
    )
}