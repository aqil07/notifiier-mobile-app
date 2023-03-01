/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
// import Geolocation from 'react-native-geolocation-service';


// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { NotifierForm } from '../components/contactForm.native';

it('renders correctly', () => {
  const app = renderer.create(<NotifierForm />).toJSON();
  expect(app).toMatchSnapshot();
});
