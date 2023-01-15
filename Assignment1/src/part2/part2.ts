import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
export const countVowels = ((str:string) => (stringToArray(str).filter(c =>'aeiou'.includes(c.toLowerCase())).length));

/* Question 2 */
const convert : (st: string[], counter: number, prev: string, i: number) => string = (st, counter, prev ,i) => 
    (i >= st.length)? (counter != 0)? prev+(counter+1).toString(): prev: (st[i] === prev)? convert(st, counter+1, prev, i+1): (prev != '')? (counter != 0)?
    prev+(counter+1).toString()+convert(st, 0, st[i], i+1): prev+convert(st, 0, st[i], i+1): convert(st, 0, st[i], i+1);


export const runLengthEncoding =R.pipe(
    (str : string) : string[] => stringToArray(str),
    (str :string[]) : string => convert(str, 0, '', 0)
);



/* Question 3 */
const leftB = ['(', '[', '{'];
const allB = ['(', '[', '{', ')', ']', '}'];
const check: (st: string[], prev: string, index: number, map:{[key: string]: string}) => 
    boolean = (st, prev, index, map) => (leftB.includes(st[index]))? check(st, st[index], index+1, map): (st.length === 0)? true:
    (map[st[index]] === prev)? check(R.remove(index-1, 2, st), '', index-2, map): (prev != '')? false: check(st, st[index], index+1, map);


const mapp = {')':'(', '}':'{', ']':'['};
export const isPaired = R.pipe (
    (st: string)  => stringToArray(st),
    (st: string[]) => R.filter(bracket => allB.includes(bracket), st),
    (st: string[]) => check(st, '', 0, mapp)
);
    