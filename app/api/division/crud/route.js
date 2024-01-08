import prismaHelper from "@/services/prisma.helpers";
import prisma from "@/prisma/client";
import {NextResponse} from "next/server";
import CRUD from "@/models/enums/crud-type.ts";

export const POST = async (request) => {
   const readNode = async (id) => {
      const data = await prisma.division.findMany({
         where : {parent_id: id},
         include: {
            halls: true,
         },
         orderBy: {
            name: 'asc'
         }
      });

      const result = data.map((item) => {
         return {
            key: `${id??0}-${item.id}`,
            data: {
               id: item.id,
               name: item.name,
               short_name: item.short_name,
               contacts: item.contacts,
               attachment_id: item.attachment_id,
               halls: item.halls
            }
         }
      });

      for (const node of result) {
         node.children = await readNode(node.data.id);
      }

      return result;
   }

   const create = async (model) => {
      const result = await prisma.division.create({
         data: {
            name: model.name,
            short_name: model.short_name,
            contacts: model.contacts,
            parent_id: model.parent_id,
            attachment_id: model.attachment_id,
            halls: {
               connect: model.halls.map((i) => { return {id: i}})
            }
         }
      });

      return result;
   }

   const read = async (model) => {
      const result = await readNode(null);
      return result;
   }

   const update = async (model) => {
      const result = await prisma.division.update({
         where: {
            id: model.id
         },
         data: {
            name: model.name,
            short_name: model.short_name,
            contacts: model.contacts,
            attachment_id: model.attachment_id,
            halls: {
               connect: model.halls.map((i) => { return {id: i}})
            }
         }
      });

      return result;
   }

   const drop = async (model) => {
      const result = await prisma.division.delete({
         where: {
            id: model.id
         }
      });

      return result;
   }

   const { operation, model } = await request.json();
   try {
      let result = null;
      switch (operation) {
         case CRUD.read:
            result = await read(model);
            break;
         case CRUD.create:
            result = await create(model);
            break;
         case CRUD.update:
            result = await update(model);
            break;
         case CRUD.delete:
            result = await drop(model);
            break;
      }
      return await NextResponse.json({status: 'success', data: result});
   } catch (error) {
      return await NextResponse.json({status: 'error', data: error.stack });
   }
}