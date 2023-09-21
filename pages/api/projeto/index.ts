import type { NextApiRequest, NextApiResponse } from 'next'
import ItemDAO from '../../../database/dao/projeto';

export default async function handler(req: NextApiRequest,res: NextApiResponse) {
  try{
    const Item = ItemDAO.DB;
    const { method, query, body, headers } = req;
    let retorno = null;

    if(method === 'GET') {
      retorno = await Item.find();
    }else if(method === 'POST'){
      await Item.create(body);
    }else if(method === 'PUT'){
      res.status(404).json({
        "message": "Unknow method",
        "statusCode": 404
      });
      return;
    }else if(method === 'DELETE'){
      res.status(404).json({
        "message": "Unknow method",
        "statusCode": 404
      });
      return;
    }

    res.status(200).json(retorno);
  }catch(err){
    res.status(500).json({
      "message": err,
      "statusCode": 500
    });
  }
}