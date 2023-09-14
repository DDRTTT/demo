import request from '@/utils/request';

export async function queryTask(data) {
    return request((`/api/amc-datalink-server/data-view/query/http`), {
      method: 'POST',
      data,
    });
}