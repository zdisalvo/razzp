import { GeoFire } from 'geofire';
import { firestore } from '../firebase/firebase';

const geoFireRef = firestore.ref('geofire');
const geoFire = new GeoFire(geoFireRef);

export { geoFire };
