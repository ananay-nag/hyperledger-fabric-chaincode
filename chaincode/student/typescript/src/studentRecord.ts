/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from "fabric-contract-api";
import { Student } from "./student";
import { v4 as uuidv4 } from "uuid";

export class StudentRecords extends Contract {
    public async initLedger(ctx: Context) {
        console.info("============= START : Initialize Ledger ===========");
        const student: Student[] = [
            {
                firstName: "ABC",
                lastName: "None",
                email: "abc@gmail.com",
                mobile: "9999999999",
                address: "abc",
                city: "delhi",
                uuid: uuidv4(),
            },
            {
                firstName: "XYZ",
                lastName: "None",
                email: "xyz@gmail.com",
                mobile: "8888888888",
                address: "xyz",
                city: "mumbai",
                uuid: uuidv4(),
            },
        ];

        for (let i = 0; i < student.length; i++) {
            await ctx.stub.putState(
                student[i].uuid,
                Buffer.from(JSON.stringify(student[i]))
            );
            console.info("Added <--> ", student[i]);
        }
        console.info("============= END : Initialize Ledger ===========");
    }

    public async queryStudent(ctx: Context, uuid: string): Promise<string> {
        const studentBuffer = await ctx.stub.getState(uuid); // get the student from chaincode state
        if (!studentBuffer || studentBuffer.length === 0) {
            throw new Error(`${uuid} does not exist`);
        }
        console.log(studentBuffer.toString());
        return studentBuffer.toString();
    }

    public async createStudent(ctx: Context, newStudent: string) {
        console.info("============= START : Create Student ===========");
        const student: Student = JSON.parse(newStudent);
        await ctx.stub.putState(
            student?.uuid,
            Buffer.from(JSON.stringify(student))
        );
        return JSON.stringify({ Key: `${student?.uuid} created` });
        console.info("============= END : Create Student ===========");
    }

    public async queryAllStudents(ctx: Context): Promise<string> {
        const startKey: string = "";
        const endKey: string = "";
        const allResults: any[] = [];
        for await (const { key, value } of ctx.stub.getStateByRange(
            startKey,
            endKey
        )) {
            const strValue: string = Buffer.from(value).toString("utf8");
            let record: string;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
            }
            allResults.push({ [key["uuid"]]: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    public async changeStudentDetails(
        ctx: Context,
        uuid: string,
        detail: string
    ) {
        console.info("============= START : change Student Detail ===========");

        const studentBuffer = await ctx.stub.getState(uuid); // get the student from chaincode state
        if (!studentBuffer || !studentBuffer.length) {
            throw new Error(`Student ${uuid} does not exist`);
        }
        let student: Student = JSON.parse(studentBuffer.toString());
        student = { ...student, ...JSON.parse(detail) };
        await ctx.stub.putState(uuid, Buffer.from(JSON.stringify(student)));
        console.info("============= END : change Student Detail ===========");
        return JSON.stringify({ Key: `${student?.uuid} updated` });
    }
}
    