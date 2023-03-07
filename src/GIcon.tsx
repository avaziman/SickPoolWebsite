interface Props {
    name: string;
    isDarkMode: boolean;
    classNameAddition?: string
}

export default function GIcon(props: Props) {
    return (<>
        <span className={"material-symbols-outlined"
            // + (props.isDarkMode ? " md-dark" : " md-light")
            + (props.classNameAddition ?  (" " + props.classNameAddition) : "")
        } translate="no" aria-hidden="true">
            {props.name}
        </span>
    </>);
}