import React from "react";

export default function Page({ data }: any){
    console.log(data?.name , "name");
    const [count, setCount] = React.useState(0);
    return <div>Page asd sad 
        {data?.name}
        <h1>Counter {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
}