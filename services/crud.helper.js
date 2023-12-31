import CircleProgress from "./circle.progress";

class CrudHelper {
   crud = async(controller, operation, model) => {
      const res = await fetch(`/api/${controller}/crud`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({operation: operation, model: model}),
      });
      return await res.json();
   }
}

export default new CrudHelper();