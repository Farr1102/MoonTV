import { ApiSite } from '@/lib/config';

export const ADULT_API_SITES: ApiSite[] = [
  {
    key: 'adult_155',
    name: '155资源',
    api: 'https://155api.com/api.php/provide/vod',
  },
  {
    key: 'adult_forest',
    name: '森林资源',
    api: 'https://slapibf.com/api.php/provide/vod',
  },
  {
    key: 'adult_lebo',
    name: '乐播资源',
    api: 'https://lbapi9.com/api.php/provide/vod',
  },
  {
    key: 'adult_jkun',
    name: 'JKUN资源',
    api: 'https://jkunzyapi.com/api.php/provide/vod',
  },
  {
    key: 'adult_yutu',
    name: '玉兔资源',
    api: 'https://apiyutu.com/api.php/provide/vod',
  },
  {
    key: 'adult_naixiang',
    name: '奶香资源',
    api: 'https://naixxzy.com/api.php/provide/vod',
  },
  {
    key: 'adult_lajiao',
    name: '辣椒资源',
    api: 'https://apilj.com/api.php/provide/vod',
  },
  {
    key: 'adult_souav',
    name: 'souav资源',
    api: 'https://api.souavzy.vip/api.php/provide/vod',
  },
  {
    key: 'adult_doudou',
    name: '豆豆资源',
    api: 'https://api.douapi.cc/api.php/provide/vod',
  },
  {
    key: 'adult_didi',
    name: '滴滴资源',
    api: 'https://api.ddapi.cc/api.php/provide/vod',
  },
  {
    key: 'adult_heiliao',
    name: '黑料资源',
    api: 'https://www.heiliaozyapi.com/api.php/provide/vod',
  },
  {
    key: 'adult_taohua',
    name: '桃花资源',
    api: 'https://thzy1.me/api.php/provide/vod',
  },
];

export function getAdultApiSite(source: string): ApiSite | undefined {
  return ADULT_API_SITES.find((site) => site.key === source);
}
