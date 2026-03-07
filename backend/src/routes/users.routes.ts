import { Request, Response, Router } from "express";

import { usersData } from "../data/users.data";

import { ApiResponse, CreateUserDto, UpdateUserDto } from "../types";
import { ExceptionHandler } from "winston";


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
    
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: userWithoutPassword,
        message: 'Usuario encontrado'
    });
});


router.post('/', (req: Request, res: Response)=>{
    const {name, email, password} : CreateUserDto = req.body;

    if(!email || !password || !name){
        return res.status(400).json({
            success: false,
            message: 'Faltan datos requeridos'
        });
    }

    if (usersData.some((u) => u.email === email)){
        return res.status(400).json({
            success: false,
            message: 'El email ya está registrado'
        });
    }

    const newUser = {
        id: String(usersData.length + 1),
        email, 
        password,
        name,
        role: 'STUDENT' as const,
        createdAt: new Date(),

    }

    usersData.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;

    const response: ApiResponse = {
        success: true,
        data: userWithoutPassword,
        message: 'Usuario creado correctamente',
     };

    res.status(201).json(response);
});




router.put('/:id', (req: Request, res: Response)=>{
    const {id} = req.params;
    const {email, name}: UpdateUserDto = req.body;

    const userIndex = usersData.findIndex((u)=> u.id === id);

    if (userIndex === -1){
        return res.status(404).json({
            success: false, 
            message: 'Usuario no encontrado'
        });

    }

    if (email) usersData[userIndex].email = email;
    if (name) usersData[userIndex].name = name;


    const { password, ...userWithoutPassword } = usersData[userIndex];

    const response: ApiResponse = {
        success: true, 
        data: userWithoutPassword,
        message: 'usuario encontrado y actualizado correctamente'

    }
    res.json(response);
});


router.delete('/:id', (req: Request, res: Response)=>{
    const {id} = req.params;

    const userIndex = usersData.findIndex((u) => u.id === id);

    if (userIndex === -1){
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    usersData.splice(userIndex, 1);

    res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
    });
});


export default router;