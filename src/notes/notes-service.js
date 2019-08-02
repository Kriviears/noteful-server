'use strict';

const NotesService = {
  getAllNotes(knex){
    return knex('notes').select('*');
  },

  insertNote(knex, newUser){
    return knex('notes')
      .insert(newUser)
      .returning('*')
      .then(rows =>{
        return rows[0];
      });
  },

  getById(knex, id){
    return knex('notes')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteNote(knex, id){
    return knex('notes')
      .where({ id })
      .delete();
  },

  updateNote(knex, id, newUserFields){
    return knex('notes')
      .where({ id })
      .update(newUserFields);
  }
};

module.exports =  NotesService;