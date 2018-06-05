var request = require('supertest');

var conn_name = 'TestConnection';
var conn_name_2 = 'TestConnection2';

// When executing these tests (they are not automatically executed as part of the
// 'npm test' command), an instance of MongoDB with authentication turned on must
// be available.  Provide the connection string and credentials for that database
// below once available.  The test can then be executed by issuing the following:
//
// npm run test-single tests/protected-connections-test.js

var conn_string = 'mongodb://{DB_USERNAME}:{DB_PASSWORD}@127.0.0.1';
var conn_username = 'username';
var conn_password = 'password';

const app = require('../app');
var agent = request.agent(app);

describe('Add protected connection', function(){
    it('Add a new connection', function(done){
        agent
            .post('/config/add_config')
            .send({0: conn_name, 1: conn_string, 2: '{}', 3: conn_username, 4: conn_password})
            .expect(200)
            .expect({'msg': 'Config successfully added'}, done);
    });
    it('Fail adding a new connection (invalid credentials)', function(done){
        agent
            .post('/config/add_config')
            .send({0: conn_name_2, 1: conn_string, 2: '{}', 3: 'XXXX', 4: 'XXXX'})
            .expect(400)
            .expect({'msg': 'Config error: MongoError: authentication fail'}, done);
    });
});

describe('Update protected connection', function(){
    it('Updating an existing connection', function(done){
        agent
            .post('/config/update_config')
            .send({curr_config: conn_name, conn_name: conn_name_2, conn_string, conn_username, conn_password})
            .expect(200)
            .expect({
                'msg': 'Config successfully updated',
                'name': conn_name_2,
                'string': conn_string
            }, done);
    });
    it('Fail updating an existing connection (invalid credentials)', function(done){
        agent
            .post('/config/update_config')
            .send({curr_config: conn_name_2, conn_name: conn_name, conn_string, conn_username: 'XXXX', conn_password: 'XXXX'})
            .expect(400)
            .expect({'msg': 'Config error: MongoError: authentication fail'}, done);
    });
});

describe('Remove protected connection', function(){
    it('Fail removing an existing connection (invalid credentials)', function(done){
        agent
            .post('/config/drop_config')
            .send({'curr_config': conn_name_2, conn_string, conn_username: 'XXXX', conn_password: 'XXXX'})
            .expect(400)
            .expect({'msg': 'Delete error: MongoError: authentication fail'}, done);
    });
    it('Remove an existing connection', function(done){
        agent
            .post('/config/drop_config')
            .send({'curr_config': conn_name_2, conn_string, conn_username, conn_password})
            .expect(200)
            .expect({'msg': 'Config successfully deleted'}, done);
    });
});
