| what               | res   |
|--------------------|-------|
| 0                  | false |
| 1                  | false |
| '0'                | true  |
| '1'                | true  |
| ()=>{}             | false |
| Boolean            | false |
| Boolean()          | false |
| Function           | false |
| Function()         | false |
| Number             | false |
| Number()           | false |
| [ 1 ]              | true  |
| []                 | true  |
| false              | false |
| function(){}       | false |
| new Boolean()      | false |
| new Boolean(false) | false |
| new Boolean(true)  | false |
| new Function()     | false |
| new Number(0)      | false |
| new Number(1)      | false |
| new Number()       | false |
| null               | false |
| true               | false |
| undefined          | false |
| { hi : 'bye' }     | false |
| {}                 | false |