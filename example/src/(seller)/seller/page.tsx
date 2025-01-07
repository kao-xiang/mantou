import React from "react";

export default function Page(){
    const [count, setCount] = React.useState(0);
    return <div>Seller
        <h1>Counter {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
}