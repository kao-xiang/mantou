import React from 'react';
export default function Page({ children }: any) {
    const [count, setCount] = React.useState(0);
    return <div>Page asd Layout Seller
        asdas
        <h1>Counter {count}</h1>
        {children}
    </div>
}
