var testController;
var TestController = Ember.Controller.extend(Ember.SimpleAuth.LoginControllerMixin, {
  actions: {
    sessionAuthenticationSucceeded: function() {
      this.invokedSessionAuthenticationSucceeded = true;
    },
    sessionAuthenticationFailed: function(error) {
      this.invokedSessionAuthenticationFailed     = true;
      this.invokedSessionAuthenticationFailedWith = error;
    }
  }
});

var sessionMock;
var SessionMock = Ember.Object.extend({
  authenticate: function(authenticator, options) {
    this.invokedAuthenticate     = true;
    this.invokedAuthenticateWith = { authenticator: authenticator, options: options };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!!SessionMock._resolve) {
        resolve(SessionMock._resolve);
      } else {
        reject(SessionMock._reject);
      }
    });
  }
});

module('Ember.SimpleAuth.LoginControllerMixin', {
  setup: function() {
    testController = TestController.create();
    sessionMock    = SessionMock.create();
    testController.set('session', sessionMock);
    testController.setProperties({ identification: 'identification', password: 'password' });
  }
});

test('authenticates the session', function() {
  Ember.run(function() {
    testController.setProperties({ identification: 'identification', password: 'password' });
    testController.send('authenticate');
  });

  ok(sessionMock.invokedAuthenticate, 'Ember.SimpleAuth.LoginControllerMixin authenticates the session when authentication is triggered.');
  equal(sessionMock.invokedAuthenticateWith.authenticator, 'ember-simple-auth:authenticators:oauth2', 'Ember.SimpleAuth.LoginControllerMixin authenticates the session with the correct authenticator.');
  deepEqual(sessionMock.invokedAuthenticateWith.options, { identification: 'identification', password: 'password' }, 'Ember.SimpleAuth.LoginControllerMixin authenticates the session with identification and password.');
});

test('does not authenticate the session when identification or password are empty', function() {
  testController.setProperties({ identification: '', password: 'password' });
  testController.send('authenticate');

  ok(!sessionMock.invokedAuthenticate, 'Ember.SimpleAuth.LoginControllerMixin does not authenticate the session when authentication is triggered but identification is empty.');

  testController.setProperties({ identification: 'identification', password: '' });
  testController.send('authenticate');

  ok(!sessionMock.invokedAuthenticate, 'Ember.SimpleAuth.LoginControllerMixin does not authenticate the session when authentication is triggered but password is empty.');

  testController.setProperties({ identification: '', password: '' });
  testController.send('authenticate');

  ok(!sessionMock.invokedAuthenticate, 'Ember.SimpleAuth.LoginControllerMixin does not authenticate the session when authentication is triggered but identification and password are empty.');
});
