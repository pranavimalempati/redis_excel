const excelJs = require("exceljs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { client,
    createRecordKey} = require ('./cache')



const uploadfile = async (req, res) => {
    try {
        const data = [];
        const errMsg = [];
        // Read excel file
        const workbook = new excelJs.Workbook();
        const result = await workbook.xlsx.readFile(req.file.path);
        const sheetCount = workbook.worksheets.length;
        if (sheetCount === 0) {
            errMsg.push({ message: "Workbook empty." });
        } else {
            for (let i = 0; i < sheetCount; i++) {
                let sheet = workbook.worksheets[i];
                sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    console.log("rowNumber",rowNumber)
                    console.log("cell",row.actualCellCount)
                    if (rowNumber === 1 && row.actualCellCount === 2) {
                        // Checking if Header exists
                        if (!row.hasValues) {
                            errMsg.push({ status: "Error", message: "Empty Headers" });
                        } else if (row.values[1] !== "Name" || row.values[2] !== "Email") {
                            errMsg.push({
                                location: "Row " + rowNumber,
                                message: "Incorrect Headers",
                            });
                        }
                    }
                    // Checking only those rows which have a value
                    else if (row.hasValues) {
                        const alphabetRegex = new RegExp(/^[a-zA-Z]+$/);
                        const emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
                        if (row.cellCount === 2) {
                            console.log("cellcount:",row.cellCount)
                            console.log(row.values[1])
                            console.log(row.values[2])
                            if (row.values[1] !== undefined && row.values[2] !== undefined) {
                                if (alphabetRegex.test(row.values[1]) && emailRegex.test(row.values[2])) {
                                    data.push({
                                        name: row.values[1],email: row.values[2]
                                    });
                                } else {
                                    errMsg.push({
                                        location: `Row:${rowNumber}`,
                                        message: 'name should have only letter,'+
                                                   'invalid email prototype,'
                                     });
                                }
                            } else {
                                errMsg.push({
                                    location: "Row " + rowNumber,
                                    message: "one column in excel can not be empty.",
                                });
                            }
                        } else {
                            errMsg.push({
                                location: "Row " + rowNumber,
                                message: "excel should not have more than two columns",
                            });
                        }
                    }
                });
            }
        }
        if (errMsg.length > 0) {
            res.status(400).json({
                status: "failed",
                response: errMsg,
                message: "Invalid excel sheet",
            });
        } else {
            console.log("ghv", data)  
            for(let value of data){
            await client.set(await (await createRecordKey(value,'PROJECT#')).key||'',JSON.stringify(value))

                // await client.set(JSON.stringify(value.name),JSON.stringify(value))
            }    
        //     for(let student of data) {
        //     //   await (await redisConnect()).response?.set(await (await createRecordKey(student,'PROJECT#')).key||'',JSON.stringify(student))
        //     await (await redisConnect()).response?.get(await (await createRecordKey(student,'*')).key||'')
        // //    console.log(result)
        const allkeys= await client.keys('*');
        for(let student of allkeys){
            let Value=await client.get(student);
            await prisma.student.create({
                data:JSON.parse(Value)
            })
        }
        console.log("All data --> ",allkeys)    
        //     }
            // const record = await prisma.student.createMany({
            //     data:data
            // })
            res.status(200).json({
                status: "success",
                response: { data },
                message: "excel file uploaded successfully",
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
}


module.exports = { uploadfile }
