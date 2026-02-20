import React from "react"

const MinMaxInfo = (props:any) => {
    const { min, max } = props;
    return <div className="col-12 text-right limit-mobile m-t-10" >
    <span className="m-r-5"><b >Min: &nbsp;</b>
    <span >{min}</span>
    </span>
     <span className="m-r-5"><b >Max: &nbsp;</b><span >
        {max}</span>
        </span>
</div>
}
export default React.memo(MinMaxInfo)