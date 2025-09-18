// src/services/icecatService.js
import axios from 'axios';

const ICECAT_BASE_URL = 'https://live.icecat.biz/api';
const SHOP_NAME = 'vcloudchoice';
const LANG = 'en';
const APP_KEY = 'HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf';

export const fetchProductFromIcecat = async (productCode, brand) => {
  try {
    const url = `${ICECAT_BASE_URL}?shopname=${SHOP_NAME}&lang=${LANG}&ProductCode=${productCode}&Brand=${brand}&app_key=${APP_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.data.msg === 'OK' && response.data.data) {
      return response.data.data;
    } else {
      throw new Error('Product not found in Icecat');
    }
  } catch (error) {
    console.error('Error fetching from Icecat:', error);
    throw new Error(error.response?.data?.msg || 'Failed to fetch product from Icecat');
  }
};

export const mapIcecatToProduct = (icecatData) => {
  const generalInfo = icecatData.GeneralInfo;
  const image = icecatData.Image;
  const gallery = icecatData.Gallery || [];

  return {
    sku: generalInfo.BrandPartCode || '',
    mfr: generalInfo.Brand || '',
    techPartNo: generalInfo.BrandPartCode || '',
    title: generalInfo.Title || '',
    shortDescp: generalInfo.SummaryDescription?.ShortSummaryDescription || '',
    longDescp: generalInfo.Description?.LongDesc || '',
    metaTitle: generalInfo.Title || '',
    metaDescp: generalInfo.SummaryDescription?.LongSummaryDescription || '',
    productSource: 'Icecat',
    userId: 'system',
    mainImageUrl: image?.HighPic || image?.LowPic || '',
    detailImageUrls: gallery
      .filter(img => img.Pic && img.IsMain === 'N')
      .map(img => img.Pic)
      .slice(0, 5),
  };
};