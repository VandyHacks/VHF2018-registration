angular.module('app')
.factory('EventsService', [
  '$http',
  function ($http) {
    const base = '/api/events/';

    return {
      getEvents: function () {
        return $http.get(base);
      },
      addEvent: function (name, open, type) {
        return $http.post(base, {
          name,
          open,
          type
        });
      },
      getAttendees: function (eventId) {
        return $http.get(base + eventId);
      }
    };
  }
]);
