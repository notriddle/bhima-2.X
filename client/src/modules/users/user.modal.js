angular.module('bhima.controllers')
  .controller('UserModalController', UserModalController);

UserModalController.$inject = ['$state', 'ProjectService', 'UserService', 'NotifyService', 'appcache'];

function UserModalController($state, Projects, Users, Notify, AppCache) {
  var vm = this;

  var cache = AppCache('UserModal');

  // the user object that is either edited or created
  vm.user = {};
  vm.stateParams = {};

  if($state.params.creating || $state.params.id){
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }


  vm.isCreating = vm.stateParams.creating;

  //exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;
  vm.validPassword = validPassword;
  vm.editPassword = editPassword;

  Projects.read()
    .then(function (projects) {
      vm.projects = projects;
    })
    .catch(Notify.handleError);

  if (!vm.isCreating) {

    Users.read(vm.stateParams.id)
      .then(function (user) {
        vm.user = user;
      })
      .catch(Notify.handleError);
  } else {
    vm.user.projects = [];
  }

  // submit the data to the server from all two forms (update, create)
  function submit(userForm) {
    var promise;

    if (userForm.$invalid) { return; }
    if (!userForm.$dirty) { return; }

    promise = (vm.isCreating) ? Users.create(vm.user) : Users.update(vm.user.id, vm.user);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ?  'USERS.CREATED' : 'USERS.UPDATED';
        Notify.success(translateKey);
        $state.go('users.list', null, {reload : true});
      })
      .catch(Notify.handleError);
  }

  function closeModal () {
    $state.transitionTo('users.list');
  }

  // make sure that the passwords exist and match.
  function validPassword() {
    return Users.validatePassword(vm.user.password, vm.user.passwordVerify);
  }

  // opens a new modal to let the user set a password
  function editPassword() {
    $state.go('users.editPassword', {id : vm.user.id}, {reload : true});
  }
}


