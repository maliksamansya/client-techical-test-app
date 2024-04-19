"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Button,
  Flex,
  Input,
  Space,
  Table,
  Tag,
  TableProps,
  GetProp,
} from "antd";
import type { SearchProps } from "antd/es/input/Search";
import { AudioOutlined } from "@ant-design/icons";
import qs from "qs";
import { useEffect, useState } from "react";
const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: "#1677ff",
    }}
  />
);

type ColumnsType<T> = TableProps<T>["columns"];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;

interface DataType {
  name: string;
  age: number;
  location: string;
  email: string;
  phone: string;
  cell: string;
  picture: string;
  // login: {
  //   uuid: string;
  // };
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Parameters<GetProp<TableProps, "onChange">>[1];
}

const columns: ColumnsType<DataType> = [
  {
    title: "Nama",
    dataIndex: "name",
    width: "20%",
  },
  {
    title: "Umur",
    dataIndex: "age",
    width: "20%",
  },
  {
    title: "Alamat",
    dataIndex: "location",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "No. Telepon 1",
    dataIndex: "phone",
  },
  {
    title: "No. Telepon 2",
    dataIndex: "cell",
  },
  {
    title: "Gambar",
    dataIndex: "picture", // this is the value that is parsed from the DB / server side
    key: "picture",
    render: (pictureArray) => (
      <Image
        src={pictureArray[0]}
        alt="User"
        width={250}
        height={100}
        style={{ borderRadius: "2px" }}
      />
    ),
  },

  // {
  //   title: "Gambar",
  //   dataIndex: "picture", // this is the value that is parsed from the DB / server side
  //   key: 'picture',
  //   render: (theImageURL) => (
  //     <>
  //       {theImageURL.map((tag: any) => {
  //         // let color = tag.length > 5 ? "geekblue" : "green";
  //         // if (tag === "loser") {
  //         //   color = "volcano";
  //         // }
  //         return (
  //           <Image key={tag} alt={tag} src={tag} width={250} height={250} />
  //         );
  //       })}
  //     </>
  //   ), // 'theImageURL' is the variable you must declare in order the render the URL
  // },
  //     title: "Tags",
  //     key: "tags",
  //     dataIndex: "tags",
  //     render: (_, { tags }) => (
  //       <>
  //         {tags.map((tag) => {
  //           let color = tag.length > 5 ? "geekblue" : "green";
  //           if (tag === "loser") {
  //             color = "volcano";
  //           }
  //           return (
  //             <Tag color={color} key={tag}>
  //               {tag.toUpperCase()}
  //             </Tag>
  //           );
  //         })}
  //       </>
  //     ),
  //   },
];

const getRandomuserParams = (params: TableParams) => ({
  results: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
});
export default function Home() {
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    // console.log(info?.source, value);
    setName(value);
  };
  // console.log(name, "<<<< name");
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/manipulate-api?${qs.stringify(
          getRandomuserParams(tableParams)
        )}`
      );
      const data = await response.json();
      setData(data);
      setLoading(false);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: 200,
          // 200 is mock data, you should read it from server
          // total: data.totalCount,
        },
      });
    } catch (error) {
      // Handle errors here
      console.error("Error fetching data:", error);
      setLoading(false); // Make sure loading state is set to false
    }
  };

  function filterByName() {
    const searchTerm = name.toLowerCase(); // Ubah kata kunci pencarian menjadi huruf kecil agar case insensitive
    const filterdData = data?.filter((item: { name: string }) =>
      item.name.toLowerCase().includes(searchTerm)
    );
    // console.log(filterdData, "<<<<<<< filtered data");
    // console.log(data, "<<<<<<< data awal");
    setData(filterdData);
  }

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);
  useEffect(() => {
    filterByName();
  }, [name]);

  const handleTableChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };
  const boxStyle: React.CSSProperties = {
    width: "100%",
    // height: 120,
    borderRadius: 6,
    // border: "1px solid #40a9ff",
  };

  return (
    <div className={styles.container}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Flex style={boxStyle} justify={"space-between"} align={"center"}>
          <Search
            placeholder="input search text"
            onSearch={onSearch}
            style={{ width: 200 }}
          />
          <Button>New Data</Button>
        </Flex>
        {/* <Table columns={columns} dataSource={data} /> */}
        <Table
          columns={columns}
          // rowKey={(record) => record.login.uuid}
          dataSource={data}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Space>
    </div>
  );
}
