import { writeRecursive } from "./fs";

const f = (name: string) => {
    // split by _ or - or space
    if(!name) return "";
    const words = name?.split(/[_\-\s]/);
    // capitalize each word
    const capitalized = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    // join words with space
    return capitalized.join(" ");
}

const cn = (...args: any[]) => {
    return args.filter(Boolean).join(" ");
}

export { writeRecursive, f, cn };