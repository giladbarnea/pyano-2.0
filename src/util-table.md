| what               | res   |
|--------------------|-------|
| 0                  | false |
| 1                  | true  |
| '0'                | true  |
| '1'                | true  |
| ()=>{}             | true  |
| Boolean            | true  |
| Boolean()          | false |
| Function           | true  |
| Function()         | true  |
| Number             | true  |
| Number()           | false |
| [ 1 ]              | true  |
| []                 | false |
| false              | false |
| function(){}       | true  |
| new Boolean()      | false |
| new Boolean(false) | false |
| new Boolean(true)  | false |
| new Function()     | true  |
| new Number(0)      | false |
| new Number(1)      | false |
| new Number()       | false |
| null               | false |
| true               | true  |
| undefined          | false |
| { hi : 'bye' }     | true  |
| {}                 | false |