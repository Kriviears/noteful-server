/* eslint-disable quotes */
'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: note.id,
  title: xss(note.title),
  updated: note.updated,
  content: xss(note.content),
  folder_id: note.folder_id
});

notesRouter.route('/')
  .get((req, res, next)=>{
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(notes =>{
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next)=>{
    const knexInstance = req.app.get('db');
    const { title, content, folder_id } = req.body;
    const newNote = { title, folder_id};

    for(const [key, value] of Object.entries(newNote)){
      if (value == null){
        return res.status(400).json({
          error: { message: `Missing '${key} in request body`}
        });
      }
    }

    newNote.content = content;

    NotesService.insertNote(knexInstance, newNote)
      .then(note =>{
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter.route('/:note_id')
  .all((req, res, next)=>{
    const knexInstance = req.app.get('db');
    const { note_id } = req.params;
    NotesService.getById(knexInstance, note_id)
      .then(note =>{
        if(!note){
          return res.status(404).json({
            error: { message: `Note doesn't exist`}
          });
        }
        res.note = note;
        res.knexInstance = knexInstance;
        next();
      })
      .catch(next);
  })
  .get((req, res, next)=>{
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next)=>{
    NotesService.deleteNote(res.knexInstance, res.note.id)
      .then(()=>{
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next)=>{
    const { title, content, folder_id } = req.body;
    const newNoteData = { title, content, folder_id };

    const numberOfValues = Object.values(newNoteData).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'content', or 'folder'`
        }
      });

    NotesService.updateNote(res.knexInstance, res.note.id, newNoteData)
      .then(()=>{
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;