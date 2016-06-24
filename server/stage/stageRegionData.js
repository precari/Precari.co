

Meteor.stageRegionData = {

  /**
   * Stage data for the CentralAsia region
   */
  centralAsia: function() {

    try {
      var countries = ['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan',
        'Uzkekistan'];
      var peoples = ['Aimak', 'Dungan', 'Karakalpaks', 'Kazakh', 'Kyrgyz',
       'Russians', 'Tajik', 'Tatar', 'Turkmen', 'Uyghur', 'Uzbek' ];

      for (var i = 0; i < countries.length; i++) {
        Meteor.fixtureMethods.buildAndInsertPublicTag(countries[i]);
      }

      for (var j = 0; j < peoples.length; j++) {
        Meteor.fixtureMethods.buildAndInsertPublicTag(peoples[j]);
      }

    } catch (e) {
      console.log(e);
    }
  },

};
