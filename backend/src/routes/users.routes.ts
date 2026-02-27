import { Request, Response, Router } from "express";

import { usersData } from "../data/users.data";

import { ApiResponse, CreateUserDto, UpdateUserDto } from "../types";


const router = Router();

router.get('/', (req: Request, res: Response)=>{
    const userWithoutPassword = usersData.map(({password, ...user}) => user);

    const response: ApiResponse = {
        success: true,
        data: userWithoutPassword,
        message: 'Usuarios obtenidos correctamente'


    };

    res.json(response);

});


router.get('/:id', (req: Request, res: Response)=>{
    const {id} = req.params;

    const user = usersData.find((u) => u.id === id);

    if (!user){
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }


});
