/* eslint-disable quotes */
'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const folderRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  title: xss(folder.title)
});

folderRouter.route('/')
  .get((req, res, next)=>{
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(folders =>{
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next)=>{
    const knexInstance = req.app.get('db');
    const { title } = req.body;
    const newFolder = { title };

    if(!newFolder.title){
      return res.status(400).json({
        error: { message: `Missing 'title' in request body`}
      });
    }

    FoldersService.insertUser(knexInstance, newFolder)
      .then(folder =>{
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

folderRouter.route('/:folder_id')
  .all((req, res, next)=>{
    const knexInstance = req.app.get('db');
    const { folder_id } = req.params;
    FoldersService.getById(knexInstance, folder_id)
      .then(folder =>{
        if(!folder){
          return res.status(404).json({
            error: { message: `User doesn't exist`}
          });
        }
        res.folder = folder;
        res.knexInstance = knexInstance;
        next();
      })
      .catch(next);
  })
  .get((req, res, next)=>{
    res.json(serializeFolder(res.folder));
  })
  .patch(jsonParser, (req, res, next)=>{
    const { title } = req.body;
    const newFolderData = { title };

    const numberOfValues = Object.values(newFolderData).filter(Boolean).length;
    if(numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'title'`
        }
      });

    FoldersService.updateFolder(res.knexInstance, res.folder.id, newFolderData)
      .then(()=>{
        res.status(204).end();
      })
      .catch(next);
  })
  .delete(jsonParser, (req, res, next)=>{
    FoldersService.deleteFolder(res.knexInstance, res.folder.id)
      .then(()=>{
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = folderRouter;