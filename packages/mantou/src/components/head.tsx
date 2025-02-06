import React, { useEffect, useState, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

const Head = ({ children }: PropsWithChildren) => {
    const [headElement, setHeadElement] = useState<any>(null);

    useEffect(() => {
        setHeadElement(document.head);
    }, []);

    useEffect(() => {
        const hasTitle = React.Children.toArray(children).some(
            (child) => React.isValidElement(child) && child.type === "title"
        );
        if (hasTitle) {
            throw new Error("The Head component does not support <title> elements.");
        }
    }, [children]);

    if (!headElement) return null;

    return createPortal(children, headElement);
};

export { Head };
