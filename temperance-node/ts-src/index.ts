
import App from './App';
import * as fs from 'fs';

const port = 3000

try {
    var app = new App();
}
catch (error)
{
    console.log("ERROR ON APP ---------------------------------------------")
    console.log(error);
}
