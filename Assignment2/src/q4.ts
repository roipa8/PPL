import { map } from 'ramda';
import { CExp, Exp, isAppExp, isBoolExp, isDefineExp, isIfExp, isNumExp, isPrimOp, isProcExp, isProgram, isVarRef, Program, VarDecl } from '../imp/L3-ast';
import { valueToString } from '../imp/L3-value';
import { Result, makeFailure, bind, makeOk, safe3, mapResult, safe2 } from '../shared/result';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? bind(mapResult(l2ToPython, exp.exps), (exps:string[]) => makeOk(exps.join("\n"))) :
    isDefineExp(exp) ? bind(l2ToPython(exp.val), (val:string) => makeOk(`${exp.var.var} = ${val}`)):
    isNumExp(exp) ? makeOk(valueToString(exp.val)):
    isBoolExp(exp) ? makeOk(exp.val? 'True': 'False'):
    isPrimOp(exp) ? convertPrimOp(exp.op):
    isVarRef(exp) ? makeOk(exp.var):
    isAppExp(exp) ? convertApp(exp.rator,exp.rands):
    isIfExp(exp) ? safe3((test:string, then:string, alt: string) => makeOk(`(${then} if ${test} else ${alt})`))
                    (l2ToPython(exp.test),l2ToPython(exp.then),l2ToPython(exp.alt)):
    isProcExp(exp) ? bind(mapResult(l2ToPython, exp.body), (body:string[]) => makeOk(`(lambda ${map((arg:VarDecl) => arg.var, exp.args).join(",")} : ${body[0]})`)) :
    makeFailure("Unvalid Expression");
    
export const convertPrimOp = (op:string): Result<string>=>
    (op === "=")? makeOk("=="):
    (op === "number?")? makeOk("(lambda x : (type(x) == int or type(x) == float))"):
    (op === "boolean?")? makeOk("(lambda x : (type(x) == bool))"):
    (op === "eq?")? makeOk("=="):
    makeOk(op);

export const convertApp = (rator:CExp, rands:CExp[]): Result<string>=>
    (isPrimOp(rator) && ["+","-","*","/","and","or","<",">","=","eq?"].includes(rator.op))?  
        safe2((rator:string, rands:string[])=>makeOk(`(${rands.join(` ${rator} `)})`))
            (l2ToPython(rator),mapResult(l2ToPython,rands)):
    (isPrimOp(rator) && rator.op === "not")?
        bind(mapResult(l2ToPython,rands),(rands:string[])=>makeOk(`(${rator.op} ${rands[0]})`)) :
    (isPrimOp(rator) && ["number?","boolean?"].includes(rator.op))?  
        safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands[0]})`))
            (l2ToPython(rator), mapResult(l2ToPython, rands)) :
    safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands.join(",")})`))
        (l2ToPython(rator), mapResult(l2ToPython, rands));
