import './server/server';

const log = console.log;

console.log = (...data: any[]) =>
    log(new Date().toTimeString().split(' ')[0], ...data);