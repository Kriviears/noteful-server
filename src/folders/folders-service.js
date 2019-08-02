'use strict';

const FoldersService = {
  getAllFolders(knex){
    return knex('folders').select('*');
  },

  insertFolder(knex, newFolder){
    return knex('folders')
      .insert(newFolder)
      .returning('*')
      .then(rows =>{
        return rows[0];
      });
  },

  getById(knex, id){
    return knex('folders')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteFolder(knex, id){
    return knex('folders')
      .where({ id })
      .delete();

  },

  updateFolder(knex, id, newFolderFields){
    return knex('folders')
      .where({ id })
      .update(newFolderFields);
  }
};

module.exports = FoldersService;