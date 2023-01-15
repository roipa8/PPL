import { /*ClassExp, ProcExp, */  makeLetExp,ClassExp, Exp, isProgram, Program, isClassExp, CExp, makeProcExp, isExp, isDefineExp, makeDefineExp, isAtomicExp, isLitExp, isIfExp, isAppExp, makeAppExp, isProcExp, makeProgram, makeBoolExp, makeVarDecl, ProcExp, makeVarRef, makeIfExp, makeLitExp, LitExp, VarRef, isLetExp, makePrimOp, Binding, makeBinding, isCExp} from "./L31-ast";
import { Result, makeFailure, mapResult, makeOk,bind, safe3, safe2 } from "../shared/result";
import { map} from "ramda";
import { makeSymbolSExp } from "../imp/L3-value";


/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/


export const class2proc = (exp: ClassExp): ProcExp =>{
    const vars:string[]=map((b)=>b.var.var,exp.methods);
    const vals:CExp[]=map((b)=>b.val,exp.methods);
    return makeProcExp(exp.fields,[makeProcExp([makeVarDecl('msg')],[makeBodyExp(vars,vals)])]);
}

export const makeBodyExp = (vars:string[],vals:CExp[]): CExp =>{
    if(vars.length===0){
        return makeBoolExp(false);
    }
    const lit:LitExp=makeLitExp(makeSymbolSExp(vars[0]));
    const msg:VarRef=makeVarRef('msg');
    return makeIfExp(makeAppExp(makePrimOp('eq?'),[msg,lit]),makeAppExp(vals[0],[]),makeBodyExp(vars.slice(1),vals.slice(1)));
}

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/


    

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    isExp(exp) ? L31ExpToL3(exp):
    isProgram(exp) ? bind(mapResult(L31ExpToL3,exp.exps),(exps: Exp[])=> makeOk(makeProgram(exps))):
    makeFailure("Not Valid Expression");


export const L31ExpToL3 = (exp: Exp): Result<Exp> =>
    isCExp(exp) ? L31CExpToL3(exp):
    isDefineExp(exp) ? bind(L31CExpToL3(exp.val), (val: CExp) => makeOk(makeDefineExp(exp.var, val))) :
    makeFailure(`Failed ${exp}`);

export const L31CExpToL3 =(exp: CExp): Result<CExp>=>
    isAtomicExp(exp) ? makeOk(exp):
    isLitExp(exp) ? makeOk(exp): 
    isIfExp(exp) ? safe3((test: CExp, then: CExp, alt: CExp) => makeOk(makeIfExp(test, then, alt)))
                        (L31CExpToL3(exp.test),L31CExpToL3(exp.then),L31CExpToL3(exp.alt)):
    isAppExp(exp) ? safe2((rator: CExp, rands: CExp[]) => makeOk(makeAppExp(rator, rands)))
                        (L31CExpToL3(exp.rator), mapResult(L31CExpToL3, exp.rands)) :
    isProcExp(exp) ? bind(mapResult(L31CExpToL3, exp.body), (body: CExp[]) => makeOk(makeProcExp(exp.args, body))) :
    isLetExp(exp) ?   safe2((binding: Binding[], body: CExp[]) => makeOk(makeLetExp(binding,body)))
                 (mapResult((binding:Binding)=>bind(L31CExpToL3(binding.val),(val:CExp)=>makeOk(makeBinding(binding.var.var,val))),exp.bindings), mapResult(L31CExpToL3, exp.body)) :       
    isClassExp(exp) ? L31CExpToL3(class2proc(exp)) :
    makeFailure(`Failed ${exp}`);



