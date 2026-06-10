import rider1 from '../assets/rider1.jpg';
import rider2 from '../assets/rider2.jpg';
import rider3 from '../assets/rider3.jpg';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  image: string; // path to image asset
}

export const riders: Rider[] = [
  {
    id: 'R001',
    name: 'Kwame Boateng',
    phone: '+233 24 123 4567',
    vehicleNumber: 'GT-1234-21',
    image: rider1,
  },
  {
    id: 'R002',
    name: 'Akosua Mensah',
    phone: '+233 20 987 6543',
    vehicleNumber: 'GR-5678-22',
    image: rider2,
  },
  {
    id: 'R003',
    name: 'Yaw Owusu',
    phone: '+233 55 112 2334',
    vehicleNumber: 'AS-4321-23',
    image: rider3,
  },
]; 